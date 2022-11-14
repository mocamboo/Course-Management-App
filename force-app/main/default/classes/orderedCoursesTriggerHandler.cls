public class orderedCoursesTriggerHandler {
    
    public static void AFTER_INSERT(List<Ordered_Courses__c> newList){
        updateInventory(newList, null);
    }
    public static void AFTER_UPDATE(List<Ordered_Courses__c> newList, Map<Id, Ordered_Courses__c> oldMap){
        Boolean isUpdate = false;
        for(Ordered_Courses__c orderedCourse : newList){
            if( orderedCourse.Quantity__c != oldMap.get(orderedCourse.Id).Quantity__c)
                isUpdate = true;
        }
        if(isUpdate)
            updateInventory(newList, oldMap);
    }
    public static void updateInventory(List<Ordered_Courses__c> newList, Map<Id, Ordered_Courses__c> oldMap){
        
        Map<Id,String> courseMap = new Map<Id,String>();//{CourseId : Quantity}
        
        for(Ordered_Courses__c orderedCourse : newList){
            Integer previousQuantity = 0;
            if(oldMap != null){
                previousQuantity = Integer.valueOf(oldMap.get(orderedCourse.Id).Quantity__c);
            }
            Integer countToSubtract = Integer.valueOf(orderedCourse.Quantity__c)  - previousQuantity;
            courseMap.put(orderedCourse.Course__c, String.valueOf(countToSubtract));
        }
        List<Course__c> coursesToUpdate = [SELECT Id, Name, Inventory__c from Course__c WHERE Id IN: courseMap.keySet()];
        for(Course__c course : coursesToUpdate){
            course.Inventory__c -= Integer.valueOf(courseMap.get(course.Id));
        }
        if(coursesToUpdate.size()>0)
            update coursesToUpdate;
    }
    
}