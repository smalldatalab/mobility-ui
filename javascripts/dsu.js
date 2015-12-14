var dsu_url = "https://ohmage-omh.smalldata.io/dsu/";

var dsu =
{
    _data : [],
    _skip : 0,
    _lastDate : null,
    NOT_FOUND: -1,
    query: function(args){
        var skip = this._skip;
        var date = args["date"];
        var device = args["device"];
        var success = args["success"];
        var error = args["error"];
        var deferred = args["deferred"] || $.Deferred();

        // if the requested data available, call success callback and resolve promise,
        // else if we already pass the requested date but haven't seen the requested data, call error callbakc
        // else continue to get last 7 data points from the DSU
        var target = this._data.filter(function(d){return d.date==date && d.device==device;});
        if (target.length){
            success(target[0]);
            deferred.resolve(target);
        }
        else if(this._lastDate < date){
            error(dsu.NOT_FOUND);
            deferred.reject(dsu.NOT_FOUND)
        }else {
            $.ajax({
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                url: dsu_url + "dataPoints",
                data: {
                    schema_namespace: "cornell",
                    schema_name: "mobility-daily-summary",
                    schema_version: "2.0",
                    chronological: "desc",
                    skip: dsu._skip,
                    limit: 16
                },
                success: function (result) {

                    if(result.length > 0) {
                        var newData = result.map(
                            function (r) {
                                return r.body;
                            });
                        dsu._data =
                            dsu._data.concat(newData);
                        dsu._skip = skip + result.length;
                        dsu._lastDate =  result[result.length-1].body.date;

                        dsu.query({date: date, device: device, success: success, error: error, deferred: deferred});
                    }else{
                        // no more data, call error callback
                        error(dsu.NOT_FOUND);
                        deferred.reject(dsu.NOT_FOUND)
                    }
                },
                error: function (e, status, error) {
                    window.location.href = dsu_url + "oauth/authorize?client_id=mobility-visualization&response_type=token";
                }

            });
            return deferred.promise();

        }

    }
};

