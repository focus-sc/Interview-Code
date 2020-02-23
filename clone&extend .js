//实现对象的深拷贝和扩展对象属性
let isObject = function(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
}
let isArray = function(obj){
    return Array.isArray(obj);
}

//深拷贝对象
let clone = function(obj){
    let result;
    if(isObject(obj)){
        result = {};
        //只复制自身的属性，不复制原型上的属性
        for(let [key, value] of Object.entries(obj)){
            if(isObject(value) || isArray(value)){
                result[key] = clone(value);
            }else{
                //复制非对象属性 没有使用result[key] = value是因为这种方式无法复制get、set函数属性
                Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(obj,key));
            }
        }
        //保持原型一致
        result.__proto__ = obj.__proto__;
    }else if(isArray(obj)){
        result = [];
        for(let value of obj){
            if(isObject(value) || isArray(value)){
                result.push(clone(value));
            }else{
                result.push(value);
            }
        }
    }else if(obj !== undefined){
        result = obj;
    }
    return result;
}


//扩展对象属性，可以给目标对象扩展、构造函数扩展、构造函数的实例扩展
let $ = function(){}
$.extend = $.prototype.extend = function(){
    let length = arguments.length, 
        index = 1,
        target = arguments[0] || {};
    let options, clone, source;

    if(typeof target != 'object'){
        target = {};
    }
    //只传一个参数时给$或其实例扩展
    if(length == index){
        target = this;
        index--;
    }
    while(index < length){
        options = arguments[index];
        if(options != null){
            for(let [name, copy] of Object.entries(options)){
                if(copy && (isObject(copy) || isArray(copy))){
                    source = target[name];
                    //目标对象和源对象不是一种类型时，以源对象为主
                    if(isArray(copy) && !isArray(source)){
                        clone = [];
                    }else if(isObject(copy) && !isObject(source)){
                        clone = {};
                    }else{
                        clone = source;
                    }
                    //递归调用把返回结果给目标对象
                    target[name] = $.extend(clone, copy);
                }else if(copy !== undefined){
                    target[name] = copy;
                }
            }
        }
        index++;
    }
    return target;
}
