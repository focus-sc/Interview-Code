//call、apply、bind实现原理
Function.prototype.call = function(context, ...args){
	if(typeof this !== 'function'){
		throw new Error("....");
	}
	context = context || window;
	context.fn = this;
	let result = context.fn(...args);
	delete context.fn;
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
