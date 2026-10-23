FROM registry.suse.com/bci/python:3.14

WORKDIR /app

COPY main.py /app/

EXPOSE 8080

ENV REDIRECT_URL=http://default.url

CMD ["python3", "main.py"]
