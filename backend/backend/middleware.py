import jwt
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken, TokenBackendError
from rest_framework_simplejwt.authentication import JWTAuthentication
from user.models import User # Impor model User kustom Anda

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.protected_routes = getattr(settings, 'PROTECTED_ROUTES', [])
        self.jwt_authenticator = JWTAuthentication()

    def __call__(self, request):
        # Cek apakah path saat ini dimulai dengan salah satu route yang dilindungi
        is_protected_route = any(request.path.startswith(route) for route in self.protected_routes)

        # Beberapa path di dalam /api/ mungkin tidak memerlukan otentikasi (misalnya, dokumentasi API)
        # Anda bisa menambahkan pengecualian di sini jika perlu.
        # Contoh: if request.path.startswith('/api/docs/'): return self.get_response(request)

        if is_protected_route:
            # Coba otentikasi menggunakan JWTAuthentication dari DRF SimpleJWT
            try:
                # `authenticate` akan mengembalikan (user, validated_token) atau None
                auth_result = self.jwt_authenticator.authenticate(request)
                
                if auth_result is not None:
                    user, _ = auth_result
                    request.user = user # Set user pada request
                else:
                    # Jika authenticate mengembalikan None, berarti tidak ada token atau token tidak valid
                    # Cek apakah header Authorization ada
                    auth_header = request.headers.get('Authorization')
                    if not auth_header:
                        return JsonResponse(
                            {"detail": "Header otentikasi tidak disertakan."},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                    # Jika header ada tapi token tidak valid (misal, format salah)
                    return JsonResponse(
                        {"detail": "Token tidak valid atau format salah."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            except InvalidToken as e: # Menangkap error spesifik dari SimpleJWT
                return JsonResponse(
                    {"detail": str(e)},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except TokenError as e: # Menangkap error token umum lainnya
                 return JsonResponse(
                    {"detail": f"Token bermasalah: {str(e)}"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except Exception as e: # Fallback untuk error tak terduga lainnya
                # Log error ini untuk investigasi
                print(f"Unexpected error in JWT middleware: {e}")
                return JsonResponse(
                    {"detail": "Terjadi kesalahan saat memproses otentikasi."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        response = self.get_response(request)
        return response

