define(['marionette', 'views/dialog', 'utils'], function(Marionette, DialogView, utils) {

    return DialogView.extend({
        className: 'fixedwidth',
        template: false,
        
        initialize: function(options) {
            this.url = options.url
            this.load()
            this.iframe = $('<iframe></iframe>')
            
        },
        
        load: function() {
            var self = this
            Backbone.ajax({
                url: this.url,
                success: function(content, status, xhr) {
                    var ct = xhr.getResponseHeader('content-type')
                    if (ct.indexOf('text/plain') > -1) content = '<pre>'+content+'</pre>'

                    // inject sign handler
                    var sh = '<script src="/client/js/vendor/jquery/jquery-1.9.1.min.js"></script>\n\
                    <script type="text/javascript">\n\
                        $(document).ready(function() {\n\
                            var app = { apiurl: "'+app.apiurl+'", prop: "'+app.prop+'"}\n\
                            app.token = sessionStorage.getItem(\'token\')\n\
                            var root = "'+self.url.replace(/\?token=.*/, '')+'"\n\
                            var ajax = function(options) {\n\
                                options.data.prop = app.prop\n\
                                if (app.token) {\n\
                                    options.beforeSend = function(request){\n\
                                        request.setRequestHeader(\'Authorization\', \'Bearer \' + app.token);\n\
                                    }\n\
                                }\n\
                                return $.ajax.call(this, options)\n\
                            }\n\
                            var Backbone = { ajax: ajax }\n\
                            var sign = '+utils.sign.toString()+'\n\
                            $("a").click(function(e) {\n\
                                var is_relative_to_page = function(href) {\n\
                                    return href.match(/^\\/|(http:|https:|ftp:|mailto:|javascript:)/) === null;\n\
                                }\n\
                                var is_routable = function(href) {\n\
                                    return href.indexOf("#") === -1 && is_relative_to_page(href);\n\
                                }\n\
                                var href = $(this).attr("href")\n\
                                if (!is_routable(href)) return true\n\
                                e.preventDefault()\n\
                                var url = root+\'/\'+href\n\
                                \sign({\n\
                                    url: url,\n\
                                    callback: function(resp) {\n\
                                        window.location = url+\'?token=\'+resp.token\n\
                                    }\n\
                                })\n\
                            })\n\
                        });\n\
                    </script>'

                    var doc = self.iframe[0].contentWindow.document
                    doc.open()
                    doc.write(sh+content)
                    doc.close()
                }
            })
        },
        
        onRender: function() {
            this.$el.append(this.iframe)
            
            this.$el.find('iframe').css('width', $(window).width()*(app.mobile() ? 0.8 : 0.5))
            this.$el.find('iframe').css('height', $(window).width()*(app.mobile() ? 0.8 : 0.5))
        }
        
    })
    
})