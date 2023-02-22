// import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = true

async function handleHtmlRequest(request, env) {
  const url = new URL(request.url)
  let key = url.pathname.slice(1)

  if (key === '') {
    key = 'index.html'
  }

  const object = await env.TBP_STORAGE_BUCKET.get(key)

  if (object === null) {
    return new Response('Object Not Found', { status: 404 })
  }

  let age = 10
  if (key.indexOf('index.html') === -1) {
    age = 306923798
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Cache-Control', `Max-Age=${age}`)

  return new Response(object.body, {
    headers,
  })
}

const fetch = (event, env) => {
  return handleHtmlRequest(event, env)
}

export default {
  fetch,
}

addEventListener('fetch', async (event, env) => {
  const resp = await handleHtmlRequest(event, env)
  event.respondWith(resp)
})
