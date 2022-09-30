({
    init: function(cmp, evt, helper) {
        var myPageRef = cmp.get("v.pageReference");
        var customer = myPageRef.state.c__customer;
        var itemRecords = myPageRef.state.c__.records;
        cmp.set("v.propertyValue", customer);
        cmp.set("v.records", itemRecords);
    }
})