<?php
require __DIR__ . '/../core/Helpers.php';
load_env(base_path('.env'));
foreach (glob(base_path('core/*.php')) as $f) require $f;
foreach (glob(base_path('middleware/*.php')) as $f) require $f;
foreach (glob(base_path('services/*.php')) as $f) require $f;
foreach (glob(base_path('controllers/*.php')) as $f) require $f;
CorsMiddleware::handle();
set_exception_handler(fn($e)=>Response::json(false,'Terjadi kesalahan',null,['exception'=>$e->getMessage()],500));
$router=new Router();
require base_path('routes/api.php');
$router->dispatch(Request::method(), Request::path());
