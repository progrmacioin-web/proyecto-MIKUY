<?php

namespace App\Http\Controllers;

use App\Models\DonationRequest;
use App\Models\Message;
use App\Services\SecurityHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    private function checkParticipant(int $requestId, Request $request): ?JsonResponse
    {
        $reqRecord = DonationRequest::with('donation:id,owner_id')->find($requestId);
        if (!$reqRecord) {
            return response()->json(['error' => 'Solicitud no encontrada.'], 404);
        }
        $user = $request->user();
        $isOwner = $reqRecord->donation && $reqRecord->donation->owner_id === $user->id;
        $isOrg = $reqRecord->organization_id === $user->id;
        if ($user->role !== 'admin' && !$isOwner && !$isOrg) {
            return response()->json(['error' => 'No autorizado para esta conversación.'], 403);
        }
        return null;
    }

    public function index(Request $request, int $requestId): JsonResponse
    {
        if ($err = $this->checkParticipant($requestId, $request)) return $err;

        $messages = Message::where('request_id', $requestId)
            ->with('sender:id,name,role,photo_data')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['data' => $messages]);
    }

    public function store(Request $request, int $requestId): JsonResponse
    {
        if ($err = $this->checkParticipant($requestId, $request)) return $err;

        $body = SecurityHelper::cleanText($request->input('body'), 800);
        if ($body === '') {
            return response()->json(['error' => 'El mensaje no puede estar vacío.'], 400);
        }

        $msg = Message::create([
            'request_id' => $requestId,
            'sender_id' => $request->user()->id,
            'body' => $body,
        ]);
        $msg->load('sender:id,name,role,photo_data');

        return response()->json(['data' => $msg], 201);
    }
}
