//节流防抖
//节流函数 一段固定时间间隔内只触发一次 如鼠标移动事件
//节流函数简单时间戳版
let $throttle = function(callback, wait){
    let previous = 0;
    return function(){
	let now = Date.now(), args = Array.from(arguments), context = this;
	if(now - previous >= wait){
	    callback.apply(context, args);
	    previous = now;
	}
    }
}
//防抖函数 两个触发事件时间间隔一段时间才会生效 如连续点击时间只生效一次
//防抖函数简单立即执行版
let $debounce = function(callback, wait){
    let timeout = null;
    return function(){
	let args = Array.from(arguments), context = this;
	if(timeout){
	    clearTimeout(timeout);
	}
	let callNow = !timeout;
	timeout = setTimeout(()=>{
	    timeout = null;
	}, wait);
	if(callNow){
	    callback.apply(context);
	}
    }
}


//高级版
let throttle = function(callback, wait, {first=true,end=true}){
    //first = false 则不执行第一次 end = false 则不执行最后一次 默认前后都执行一次
    let timeout = null, previous = 0;
    let throttled = function(){
	let now = Date.now(), args = Array.from(arguments), context = this;
	//第一次不执行
	if(previous == 0 && first === false){
	    previous = now;
	}
	let remaining = wait - (now - previous);
	//时间间隔大于wait时
	if(remaining <= 0){
	    if(timeout){
		clearTimeout(timeout);
		    timeout = null;
		}
		previous = now;
		callback.apply(context, args);
	}else if(timeout == null && end === true){
	//时间间隔小于wait且可以触发最后一次时 在remaining时间之后触发之后
	    timeout = setTimeout(()=>{
	    //如果不触发第一次 previous应当归0
		previous = first === false ? 0 : Date.now();
		timeout = null;
		callback.apply(context, args);
	    }, remaining);
	}
    }
    throttled.cancel = function(){
	clearTimeout(timeout);
	previous = 0;
	timeout = null;
    }
    return throttled;
};

let debounce = function(callback, wait, immediate=true){
    let timeout = null;
    let debounced = function(){
	let args = Array.from(arguments), context = this, res;
	if(timeout){
	    clearTimeout(timeout);
	}
	if(immediate){
	    let callNow = !timeout;
	    timeout = setTimeout(()=>{timeout=null},wait);
	    if(callNow){
		res = callback.apply(context, args);
	    }
	}else{
	    timeout = setTimeout(()=>{
		timeout = null;
		res = callback.apply(context, args);
	    },wait)
	}
    return res;
    };
    debounced.cancel = function(){
	clearTimeout(timeout);
	timeout = null;
    }
    return debounced;
};


/*测试
//HTML <div id="content"> </div>
let num = 1;
let content = document.getElementById('content');

function count() {
    content.innerHTML = num++;
};
content.onmousemove = throttle(count,1000,{first:false});
*/
