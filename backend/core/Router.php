<?php
class Router {
    private array $routes=[];
    public function add(string $method,string $path, callable $handler, array $middleware=[]): void { $this->routes[] = compact('method','path','handler','middleware'); }
    public function dispatch(string $method,string $path): void {
        foreach($this->routes as $r){
            $pattern = '#^'.preg_replace('#\{[^/]+\}#','([^/]+)',$r['path']).'$#';
            if($r['method']===$method && preg_match($pattern,$path,$m)){
                array_shift($m); foreach($r['middleware'] as $mw){ $mw(); }
                call_user_func_array($r['handler'],$m); return;
            }
        }
        Response::json(false,'Endpoint tidak ditemukan',null,[],404);
    }
}
