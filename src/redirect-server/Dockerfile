FROM registry.suse.com/bci/python:3.12

WORKDIR /app

COPY main.py /app/

EXPOSE 8080

ENV REDIRECT_URL=http://default.url

CMD ["python3", "redirect_server.py"]
