public class courseraLwcController {
    
    @AuraEnabled(cacheable=true)
    public static PagedResult getPagedCourseList(String searchKey, Integer pageSize, Integer pageNumber) {
        String likeString = '%' + searchKey + '%';
        Integer offset = (pageNumber - 1) * pageSize;
        
        List<String> descriptionFilteredCourses = new List<String>();
        for(Course__c itr : [SELECT Id, Description__c FROM Course__c]){
            if(itr.Description__c.containsIgnoreCase(searchKey)){
                descriptionFilteredCourses.add(itr.Id);
            }
        }
        
        
        PagedResult result = new PagedResult();
        
        result.totalItemCount = [SELECT COUNT()
                                 FROM Course__c
                                 WHERE (Name LIKE :likeString 
                                        OR Id IN : descriptionFilteredCourses) 
                                 AND IsActive__c = true
                                 WITH SECURITY_ENFORCED];
        
        result.records = [
            SELECT Id, Name, Hours__c, Price__c, Category__c, IsActive__c, Description__c
            FROM Course__c
            WHERE ((Name LIKE : likeString) OR (Id IN : descriptionFilteredCourses)) AND IsActive__c = true
            WITH SECURITY_ENFORCED
            ORDER BY Price__c
            LIMIT : pageSize
            OFFSET : offset    
        ];
        
        return result;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Sobject> getAllCustomers(){
        try {
            return [SELECT Name, Id from Contact];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}


/**FIND likeString IN ALL FIELDS RETURNING Course__c(   Name,
Description__c, 
Hours__c, 
Price__c, 
Category__c, 
IsActive__c 
WHERE Price__c <= : safeMaxPrice
ORDER BY Price__c
LIMIT :pageSize
OFFSET :offset
);


FIND likeString IN ALL FIELDS RETURNING Course__c(Name,Description__c, Hours__c, Price__c, Category__c, IsActive__c WHERE IsActive__c =true LIMIT : safePageSize OFFSET : offset )
*/