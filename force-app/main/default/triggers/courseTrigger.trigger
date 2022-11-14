trigger courseTrigger on Course__c (before update) {
    switch on Trigger.operationType{
        when BEFORE_UPDATE{courseTriggerHandler.BEFORE_UPDATE(trigger.new, trigger.oldMap);}
    }
}