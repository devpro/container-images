from http.server import BaseHTTPRequestHandler, HTTPServer
import os

class RedirectHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        redirect_url = os.environ.get('REDIRECT_URL', 'http://default.url')
        self.send_response(302)
        self.send_header('Location', redirect_url)
        self.end_headers()

if __name__ == "__main__":
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, RedirectHandler)
    print("Server started on port 8080")
    httpd.serve_forever()
