export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 检查是否是API或socket.io请求
    if (url.pathname.startsWith('/api') || 
        url.pathname.startsWith('/socket.io') || 
        url.pathname.startsWith('/uploads')) {
      // 转发到你的Worker API端点
      const apiUrl = new URL(request.url);
      apiUrl.hostname = 'chillsync-api.workers.dev';
      apiUrl.port = '';
      
      return fetch(new Request(apiUrl, request));
    }
    
    // 否则继续常规Pages请求流程
    return env.ASSETS.fetch(request);
  },
}; 