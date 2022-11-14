trigger orderedCoursesTrigger on Ordered_Courses__c (after insert, after update) {
	/*switch on Trigger.operationType{
        when AFTER_INSERT{orderedCoursesTriggerHandler.AFTER_INSERT(trigger.new);}
        when AFTER_UPDATE{orderedCoursesTriggerHandler.AFTER_UPDATE(trigger.new, trigger.oldMap);}
    }*/
}