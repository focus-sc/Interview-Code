//call、apply、bind实现原理
Function.prototype.call = function(context, ...args){
	if(typeof this !== 'function'){
		throw new Error("....");
	}
	context = context || window;
	let temp = Symbol('function');
	context[temp] = this;
	let result = context[temp](...args);
	delete context[temp];
	return result;
}
Function.prototype.apply = function(context, args){
	this.call(context, ...args);
}

Function.prototype.bind = function(context, ...argsOut){
	return (...argsInner) => {
		this.apply(context, [...argsOut,...argsInner]);
	}
}

//泛化柯里化逐步求解
let currying = function(fn,context){
	let args = [];
	return function curry(){
		if(arguments.length === 0){
			return fn.apply(context, args);
		}
		args.push(...Array.from(arguments));
		return curry;
	}

}

//new原理实现
let New = function(fn, ...args){
	let obj = {};
	Object.setPrototypeOf(obj, fn.prototype);
	fn.apply(obj, args);
	return obj;
}
