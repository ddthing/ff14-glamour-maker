export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  
  // /xivapi/ 접두사를 제거하고 XIVAPI v2 서버 주소로 변환합니다.
  const targetPath = url.pathname.replace(/^\/xivapi/, '');
  const targetUrl = `https://v2.xivapi.com${targetPath}${url.search}`;
  
  // XIVAPI 서버로 요청을 전달(Proxy)합니다.
  const response = await fetch(targetUrl, {
    headers: context.request.headers,
    method: context.request.method,
    // GET 요청에는 body가 없으므로 안전하게 처리합니다.
    body: context.request.method === 'GET' ? null : context.request.body,
  });

  // 새로운 Response 객체를 만들어 브라우저에 전달합니다.
  return new Response(response.body, response);
};
