FROM python:3.10
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/

# CMD gunicorn wwcodesvtools.wsgi:application --bind 0.0.0.0:$PORT

# command for Stage Env - no need to load fixtures
# CMD  python manage.py migrate && python manage.py collectstatic --noinput && gunicorn wwcodesvtools.wsgi:application --bind 0.0.0.0:$PORT

# command for Development Env
CMD  python manage.py migrate && python manage.py loaddata api/fixtures/users_data.json && python manage.py collectstatic --noinput && gunicorn wwcodesvtools.wsgi:application --bind 0.0.0.0:$PORT