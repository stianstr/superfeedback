FROM ubuntu:14.04
MAINTAINER stian@eonbit.com

# Update the package repository
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \ 
	DEBIAN_FRONTEND=noninteractive apt-get upgrade -y && \
	DEBIAN_FRONTEND=noninteractive apt-get install -y apache2 wget

# Configure timezone and locale
RUN echo "Europe/Stockholm" > /etc/timezone && \
	dpkg-reconfigure -f noninteractive tzdata
RUN export LANGUAGE=en_US.UTF-8 && \
	export LANG=en_US.UTF-8 && \
	export LC_ALL=en_US.UTF-8 && \
	locale-gen en_US.UTF-8 && \
	DEBIAN_FRONTEND=noninteractive dpkg-reconfigure locales

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_DOCUMENTROOT /var/www
ENV APACHE_SERVERNAME localhost
ENV APACHE_SERVERALIAS superfeedback.eonbit.com
ENV APACHE_SERVERADMIN stian@eonbit.com

RUN mkdir -p /var/lock/apache2 /var/run/apache2 /var/log/apache2 
RUN rm -r /var/www/html/*

ADD superfeedback.js  /var/www/html/superfeedback.js
ADD superfeedback.css /var/www/html/superfeedback.css
ADD icon.png          /var/www/html/icon.png
ADD spinner.gif       /var/www/html/spinner.gif
ADD example           /var/www/html/example

RUN wget https://raw.githubusercontent.com/stianstr/annotate/master/annotate.js \
 -O /var/www/html/annotate.js
RUN wget https://raw.githubusercontent.com/stianstr/annotate/master/annotate.css \
 -O /var/www/html/annotate.css
RUN wget https://raw.githubusercontent.com/niklasvh/html2canvas/master/dist/html2canvas.min.js \
 -O /var/www/html/html2canvas.js

EXPOSE 80

CMD ["/usr/sbin/apache2", "-D", "FOREGROUND"]

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
