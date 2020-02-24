//使用Promise实现ajax封装
function ajax({
    url="",
    method='GET',
    data={},
    header={"Content-type" : "application/json"},
    dataType="json",
    responseType="text",
    timeout=60000
}) {
    return new Promise(function(resolve, reject){
        method = method.toUpperCase();
        const xhr = new XMLHttpRequest();
        let queryString = '';

        //处理查询字符串问题
        Object.keys(data).forEach(key=>{
            queryString += queryString === '' ? '' : '&';
            queryString += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        });
        if(queryString && method === 'GET'){
            let queryUrl = url.includes("?") ? url + '&' + queryString : url + '?' + queryString;
            xhr.open('GET',queryUrl);
        }else{
            xhr.open(method,url);
        }

        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                try{
                    console.log(xhr.status);
                    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
                        const response = {
                            data: dataType === 'json' ? JSON.parse(xhr.responseText) : xhr.responseText,
                            status: xhr.status,
                            statusText: xhr.statusText
                        }
                        resolve(response);
                    }else{
                        reject("Response error");
                    }
                }catch(ex){
                    reject(ex);
                }
            }
        }

        xhr.timeout = timeout;
        xhr.ontimeout = function(){
            reject("timeout");
        }

        //设置请求头并发送xhr请求
        if(method == 'POST' || method == 'PUT'){
            let contentType = header['Content-type'];
            xhr.setRequestHeader('Content-type',contentType);
            if(contentType == 'application/json'){
                xhr.send(JSON.stringify(data));
            }else if(contentType == 'application/x-www-form-urlencoded'){
                xhr.send(queryString);
            }
        }else if(method == 'GET' || method == 'DELETE'){
            xhr.send(null);
        }
    });
}
