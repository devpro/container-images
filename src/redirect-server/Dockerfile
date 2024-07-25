FROM python:3.9-slim

WORKDIR /app

COPY main.py /app/

EXPOSE 8080

ENV REDIRECT_URL=http://default.url

CMD ["python", "redirect_server.py"]
