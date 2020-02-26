/* Promise ES6语法原理实现
 * 使用
 * const promise = new Promise(function(resolve, reject) {
 * //... some code
 * if (//操作执行成功){
 * 	  resolve(value);
 * } else {
 * 	  reject(error);
 * }
 *});
 * promise.then(function(value) {
 * // success
 * }, function(error) {
 * // failure
 * });
 */
(function(window){
	const PENDING = 'pending', FULFILLED = 'fulfilled', REJECTED = 'reject';

	/**
	 * @param {function} executor 同步执行器函数
	 */
	let Promise = function(executor){
		if(typeof executor !== 'function'){
			throw new TypeError('Promise executor not a function');
		}
		if(new.target === undefined){
			return new Promise(executor);
		}

		const self = this;
		//分别为状态、存储结果数据，存储回调函数。
		self.status = PENDING;
		self.data = undefined;
		self.callbacks = [];

		let resolve = function(value){
			if(self.status === PENDING){
				self.status = FULFILLED;
				self.data = value;
				//处理事件回调，在executor中异步晚于Promise.then()时执行
				//ES6Promise加入当前事件队列的尾部 而setTimeout实际上加入的是下一事件循环的队首 只能做近似模拟
				setTimeout(()=>{
					self.callbacks.forEach((obj)=>{
						obj.onResolved(value);
					});					
				});

			}
		};

		let reject = function(reason){
			if(self.status === PENDING){
				self.status = REJECTED;
				self.data = reason;
				setTimeout(()=>{
					self.callbacks.forEach((obj)=>{
						obj.onRejected(reason);
					});					
				});
			}
		};

		//同步执行执行器函数 执行executor的过程中有可能出错
		try{
			executor(resolve,reject);
		}catch(error){
			reject(error);
		}
	}

	/**
	 * @param {function} onResolved 成功回调
	 * @param {function} onRejected	失败回调
	 * @return {Promise}
	 * 可以在一个Promise上多次调用then方法，then可以链式调用
	 * 每次调用then返回的Promise的状态取决于那一次调用then时传入参数的返回值
	 */
	Promise.prototype.then = function(onResolved, onRejected){
		const self = this;
		//如果then的参数不是function，则需要让它具有穿透能力
		onResolved = typeof onResolved === "function" ? onResolved : value => value;
        onRejected = typeof onRejected === "function" ? onRejected : reason => {throw reason};
        return new Promise(function(resolve, reject){
        	let handler = function(callback){
        		//如果抛出异常， return的Promise就会reject
        		//如果回调函数返回是promise，return的promise结果就是这个Promise结果
        		//如回调函数执行返回非Promise对象，return的Promise会resovle, value就是返回值
        		try{
        			const result = callback(self.data);
        			if(result instanceof Promise){
        				 // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise的结果
        				result.then(resolve,reject);
        			}else{
        				resolve(result);
        			}
        		}catch(error){
        			reject(error)
        		}
        	}
        	if(self.status === PENDING){
        		//将成功或失败的回调函数缓存
    			self.callbacks.push({onResolved(value){handler(onResolved)},onRejected(value){handler(onRejected)}});
        	}else if(self.status === FULFILLED){
        		setTimeout(()=> {
        			handler(onResolved);
        		});
        	}else{
        		setTimeout(()=> {
        			handler(onRejected);
        		});
        	}
        });
	}

	/**
	 * @param {function} onRejected	失败回调
	 * @return {Promise} 
	 */
	Promise.prototype.catch = function(onRejected){
		return this.then(undefined,onRejected);
	}


	/**
	 * @param {function} callback 回调函数
	 */
	Promise.prototype.finally = function(callback){
		return this.then(
			value  => Promise.resolve(callback()).then(() => value),
			reason => Promise.resolve(callback()).then(() => { throw reason })
		);
	}

	/**
	 * @param {Promise/Object/other} value
	 * @return {Promise/other} 
	 */
	Promise.resolve = function(value){
		return new Promise((resolve,reject)=>{
			if(value instanceof Promise || (toString.call(value)==='[object Object]' && value.hasOwnProperty("then"))){
				value.then(resolve,reject);
			}else{
				resolve(value);
			}
		})
	}
	Promise.reject = function(reason){
		return new Promise((resolve,reject)=>{
			reject(reason);
		})
	}

	/**
	 * @param {Array} 包含promises实例的数组或其他有Iterator接口数据结构 
	 * @return {Promise} 只有成员状态都变成fulfilled才成功，其中有一个被rejected则失败
	 */

	Promise.all = function(promises){
		promises = [...promises];
		let length = promises.length, 
			values = new Array(length), 
			count = 0;
		return new Promise((resolve,reject)=>{
			promises.forEach((p,index)=>{
				Promise.resolve(p).then(
					value=>{
						values[index] = value;
						count++;
						if(count === length){
							resolve(values);
						}
					},
					reason=>{
						reject(reason);
					}
				)
			})
		})
	}

	/**
	 * @param {Array} 包含promises实例的数组或其他有Iterator接口数据结构 
	 * @return {Promise} Promise 实例的状态由率先改变的决定
	 */
	Promise.race = function(promises){
		promises = [...promises];
		return new Promise((resolve,reject)=>{
			promises.forEach((p)=>{
				Promise.resolve(p).then(
					value=>{
						resolve(value);
					},
					reason=>{
						reject(reason);
					}
				)
			})
		})
	}

	/**
	 * @param {Array} 包含promises实例的数组或其他有Iterator接口数据结构 
	 * @return {Promise} 只有等到所有这些参数实例都返回结果，不管是fulfilled还是rejected，包装实例才会结束。
	 */
	Promise.allSettled = function(promises){
		promises = [...promises];
		let length = promises.length, 
			values = {length:0};
		return new Promise((resolve,reject)=>{
			promises.forEach((p,index)=>{
				Promise.resolve(p).then(
					value=>{
						values[values.length++] = {status: "fulfilled", value: value};
						if(values.length === length){
							resolve(values);
						}
					},
					reason=>{
						values[values.length++] = {status: "rejected", reason: reason};
						if(values.length === length){
							resolve(values);
						}
					}
				)
			})
		})
	}

	/**
	 * @param {Array} 包含promises实例的数组或其他有Iterator接口数据结构 
	 * @return {Promise} 只有成员状态都变成rejected状态才失败，其中有一个变成fulfilled状态则成功
	*/
	Promise.any = function(promises){
		promises = [...promises];
		let length = promises.length, 
			values = new Array(length), 
			count = 0;
		return new Promise((resolve,reject)=>{
			promises.forEach((p,index)=>{
				Promise.resolve(p).then(
					value=>{
						resolve(value);
					},
					reason=>{
						values[index] = reason;
						count++;
						if(count === length){
							reject(values);
						}
					}
				)
			})
		})
	}
	window.Promise = Promise;
})(this);
