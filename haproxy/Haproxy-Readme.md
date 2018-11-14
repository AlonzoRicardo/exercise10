HAProxy info

```
    Heart Beats:
    HAProxy will make health checks using the /hostname end point in all 3 instances of the message image.
    The health can be monitored easily by going to localhost/haproxy.

    maxconn: 
    It's the per-process max number of concurrent connections.
    If the number of requests goes above it, it will stop accepting new connections and they remain in the socket queue in the kernel.
    The excess connections wait for another one to complete before being accepted.

    For more detailed info on maxconn visit this awesome thread:
    https://stackoverflow.com/questions/8750518/difference-between-global-maxconn-and-server-maxconn-haproxy  
```