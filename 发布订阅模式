class PubSub { 
  constructor() { 
    this.subscribers = {}; 
  } 
 
  // 订阅方法 
  subscribe(event, callback) { 
    if (!this.subscribers[event]) { 
      this.subscribers[event] = []; 
    } 
    this.subscribers[event].push(callback); 
  } 
 
  // 发布方法 
  publish(event, data) { 
    if (this.subscribers[event]) { 
      this.subscribers[event].forEach(callback => { 
        callback(data); 
      }); 
    } 
  } 
 
  // 取消订阅方法 
  unsubscribe(event, callback) { 
    if (this.subscribers[event]) { 
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback); 
    } 
  } 
} 
 
// 使用PubSub实例 
const pubSub = new PubSub();
