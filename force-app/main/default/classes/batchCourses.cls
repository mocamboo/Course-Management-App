global class batchCourses implements Database.Batchable<sObject> {
	private Integer updateInventoryBy;
	
    public batchCourses() {
        updateInventoryBy = 10;
    }
    public batchCourses(Integer count) {
        updateInventoryBy = count;
    }

    global Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'SELECT Id, Name, Inventory__c FROM Course__c WHERE isActive__c = true';
        return Database.getQueryLocator(query);
    }

    global void execute(Database.BatchableContext BC, List<Course__c> scope) {
        for(Course__c course : scope){
            course.Inventory__c = course.Inventory__c + updateInventoryBy ;
            if(course.Inventory__c < 0){
                course.Inventory__c = 0;
            }
        }
        update scope;
    }   
    

    global void finish(Database.BatchableContext BC) {
        system.debug('big success');
    }
}