//实现数组和对象的map reduce方法和flat扁平化
//map reduce filter flat

let isObject = function(obj){
	return Object.prototype.toString.call(obj) == '[object Object]';
}

let map = function(obj, callback, context=null){
	if((!isObject(obj) && !Array.isArray(obj)) || typeof callback !== 'function'){
		throw new TypeError();
	}
	let keys = Array.isArray(obj) ? null : Object.keys(obj),
		length = keys ? keys.length : obj.length,
		res = new Array(length);
	for(let i = 0; i < length; i++){
		let curKey = keys ? keys[i] : i;
		res[i] = callback.call(context, obj[curKey], curKey, obj);
		//every if(!callback.call(context, obj[curKey], curKey, obj){return false;}
		//some if(callback.call(context, obj[curKey], curKey, obj){return true;}
		//filter if(callback.call(context, obj[curKey], curKey, obj){res.push(i);}
	}
	return res;
}

let createReduce = function(dir){
	var reduce = function(obj, callback, init, flag){
		let keys = Array.isArray(obj) ? null : Object.keys(obj),
			length = keys ? keys.length : obj.length,
			index = dir === 1 ? 0 : length - 1,
			res;
			if(!flag){
				res = keys ? obj[keys[index]] : obj[index];
				index += dir;
			}else{
				res = init;
			}
			for(; index >= 0 && index < length; index+=dir){
				let curKey = keys ? keys[index] : index;
				res = callback.call(null, res, obj[curKey], curKey, obj);
			}
			return res;
	}

	return function(obj, callback, init){
		if((!isObject(obj) && !Array.isArray(obj)) || typeof callback !== 'function'){
			throw new TypeError();
		}
		let flag = arguments.length >= 3;
		return reduce(obj, callback, init, flag);
	}
};


let reduce = createReduce(1);
let reduceRight = createReduce(-1);

let flat = function(array, level = 1){
	let res = [];
	for(let i = 0, len = array.length;i < len; i++){
		let value = array[i];
		if(Array.isArray(value) && level > 0){
			value = flat(value, level-1);
			res.push(...value);
		}else if(value !== undefined){
			res.push(value);
		}
	}
	return res;
}
//使用生成器实现数组扁平化
let flatG = function(tree){
	function* iterTree(tree) {
		if (Array.isArray(tree)) {
			for(let i=0; i < tree.length; i++) {
				yield* iterTree(tree[i]);
			}
		} else {
			yield tree;
		}
	}
	return [...iterTree(tree)];
}
