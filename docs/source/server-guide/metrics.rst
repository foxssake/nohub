Using Metrics
=============

Alongside logging, *nohub* provides various metrics for observability.

Metrics are served over HTTP, ready to be scraped by `Prometheus`_, on
``/metrics``.


.. _`Prometheus`: https://prometheus.io/

Configuring metrics
-------------------

By default, metrics are enabled, collected, and served over HTTP.

Make sure to read :ref:`Configuration/Metrics` to customize how metrics are
served.

Reported metrics
----------------

``nohub_exchanges_total``
    Total number of trimsock exchanges handled. Reported for each command.

``nohub_exchanges_failed``
    Total number of trimsock exchanges that resulted in an error. Reported for
    each command.

``nohub_exchange_duration_seconds``
    Time it took to process each trimsock exchange. Reported as a histogram,
    separately for each command.

``nohub_sessions_total``
    Total number of active sessions.

``nohub_lobbies_total``
    Total number of active lobbies.

