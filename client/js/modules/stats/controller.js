define(['marionette',
    'models/visit',
    'modules/stats/models/breakdown',
    'modules/stats/collections/pies',
    
    'modules/stats/views/visit',
    'modules/stats/views/proposal',
    
    'modules/types/gen/stats/views/visit',
    
    ], function(Marionette, Visit, BreakDown, Pies, VisitView, ProposalView, GenericVisitView) {
    
    var bc = { title: 'Visit Statistics', url: '/stats' }
    
    var controller = {
        
        // Visit Stats
        visit:  function(visit) {
            var prop = visit.replace(/-\d+/,'')
            app.cookie(prop)
            
            app.loading()
            var vis = new Visit({ VISIT: visit })
            vis.fetch({
                success: function() {
                    var breakdown = new BreakDown({ visit: visit })
                    breakdown.fetch({
                        success: function() {
                            var views = {
                                mx: VisitView,
                            }
                            
                            if (vis.get('TYPE') in views) view = views[vis.get('TYPE')]
                            else view = GenericVisitView
                            
                            app.bc.reset([bc, { title: app.prop, url: '/stats' }, { title: visit, url : '/dc/visit/'+visit }]),
                            app.content.show(new view({ model: vis, breakdown: breakdown }))
                        },
                        error: function() {
                            app.bc.reset([bc, { title: 'No Data' }])
                            app.message({ title: 'No data', message: 'No data for this visit yet' })
                        },
                    })
                },
                error: function() {
                    app.bc.reset([bc, { title: 'Error' }])
                    app.message({ title: 'No such visit', message: 'Couldnt find the specified viist' })
                }
            })
        },
        
        // Proposal Stats
        proposal: function(page) {
            app.loading()
            if (!page) page = 1
            var pies = new Pies(null, { state: { pageSize: app.mobile() ? 5 : 12, currentPage: parseInt(page) } })
            pies.fetch({
                success: function() {
                    app.bc.reset([bc, { title: 'Proposal' }, { title: app.prop }]),
                    app.content.show(new ProposalView({ pies: pies }))
                },
                error: function() {
                
                }
            })
        },
    }
        
       
    app.addInitializer(function() {
        app.on('stats:show', function(visit) {
            app.navigate('stats/visit/'+visit)
            controller.visit(visit)
        })
    })
       
    return controller
})