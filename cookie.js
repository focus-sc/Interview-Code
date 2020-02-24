//Cookie方法封装
let CookieUtil = {
    getCookie: function(){
        let cookie = {},
            all = document.cookie;
        if(all === ''){
            return cookie;
        }
        let list = all.split(';');
        for(let item of list){
            let [name, value] = item.split('=');
            cookie[decodeURIComponent(name)] = decodeURIComponent(value);
        }
        return cookie;
    },
    setCookie: function(name,value,options){
        let cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        if(options.expires instanceof Date){
            cookie += '; expires=' + options.expires.toGMTString();
        }
        if(options.path){
            cookie += '; path=' +  options.path;
        }
        if(options.domain){
            cookie += '; domain=' + options.domain;
        }
        if(options.secure){
            cookie += '; secure';
        }
        document.cookie = cookie;
    },
    removeCookie: function(name,options){
        options.expires = new Date(0);
        this.setCookie(name,"",options);
    }
}
