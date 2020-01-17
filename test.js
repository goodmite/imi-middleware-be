let gl2 = require('gelf-http');
gl2.init('http://172.16.250.247:12201/gelf');
/* Graylog will receive a basic DEBUG message with "This is a debug line" as message */
gl2.debug("SANDEEP:This is a debug line111 DILIP");
/* Graylog will receive a INFO message with variables :
    {
        "_cpu_load" : 0.509439832,
        "_ram_load" : 0.2984398,
        "_db_connections" :298
    }
*/
gl2.info({
  "cpu_load":0.509439832,
  "ram_load":0.2984398,
  "db_connections":298,
  "short_message":"hello from nodejs3"
});
/* Graylog will receive a INFO message with the following payload :
    {
        "_label" : "cpu_load",
        "_value" : 50
    }
*/
gl2.metric("cpu_load",50);