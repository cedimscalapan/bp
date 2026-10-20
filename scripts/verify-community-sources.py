"""Retrieve cited sources with TLS verification. Retrieval is NOT claim verification."""
import argparse,concurrent.futures,hashlib,json,urllib.request
from datetime import datetime,timezone
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--ids',nargs='*');args=parser.parse_args()
library=json.loads((root/'src/data/community-library.json').read_text());used={id for claim in library['claims'] for id in claim['sourceIDs']};sources=[s for s in library['sources'] if s['id'] in (set(args.ids) if args.ids else used)]
cache=Path('/workspace/research-cache');cache.mkdir(exist_ok=True)
def fetch(source):
 out={'sourceID':source['id'],'requestedURL':source['url'],'attemptedAt':datetime.now(timezone.utc).isoformat(),'claimVerification':'not_performed'}
 try:
  req=urllib.request.Request(source['url'],headers={'User-Agent':'Mozilla/5.0 (educational source verification)'})
  with urllib.request.urlopen(req,timeout=25) as r:body=r.read(15_000_000);out.update(httpStatus=r.status,resolvedURL=r.url,contentType=r.headers.get('Content-Type'))
  (cache/(source['id']+'.source')).write_bytes(body);out.update(status='retrieved_pending_editorial_review',sha256=hashlib.sha256(body).hexdigest(),bytes=len(body))
 except Exception as e:out.update(status='unavailable',error=str(e))
 return out
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(fetch,sources))
path=root/'docs/research/source-access.json';old=json.loads(path.read_text()) if path.exists() else {'results':[]};prior={r['sourceID']:r for r in old['results']};prior.update({r['sourceID']:r for r in results});path.write_text(json.dumps({'note':'A retrieved document still needs claim-level checking. No failed request counts as access.','results':list(prior.values())},indent=2)+'\n')
for r in results:print(r['sourceID'],r['status'],r.get('httpStatus',r.get('error')))
