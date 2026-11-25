<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;

class WebAppController extends Controller
{
    public function index(): Response
    {
        $compiled = public_path('app/index.html');
        if (File::exists($compiled)) {
            return response(File::get($compiled), 200)->header('Content-Type', 'text/html');
        }

        return response()->view('mikuy_status');
    }
}
