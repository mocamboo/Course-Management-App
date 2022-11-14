public class courseTriggerHandler {
    public static void BEFORE_UPDATE(List<Course__c> newList, Map<Id,Course__c> oldMap){
        if(checkSoldCountUpdate(newList, oldMap) == true)
            updateInventory(newList, oldMap);
    }
    
    public static void updateInventory(List<Course__c> newList, Map<Id,Course__c> oldMap){
        for(Course__c course : newList){
            course.Inventory__c -= (course.Sold_Courses_Count__c - oldMap.get(Course.Id).Sold_Courses_Count__c);
        }
    }
    
    public static Boolean checkSoldCountUpdate(List<Course__c> newList, Map<Id,Course__c> oldMap){
        Boolean isUpdated = false;
        for(Course__c course : newList){
            if(course.Sold_Courses_Count__c != oldMap.get(course.Id).Sold_Courses_Count__c ){
                isUpdated = true;
                break;
            }
        }
        return isUpdated;
    }
}