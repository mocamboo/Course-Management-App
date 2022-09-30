public class courseraLwcController {
    private static final Decimal DEFAULT_MAX_PRICE = 9999;
    private static final Integer DEFAULT_PAGE_SIZE = 6;


    @AuraEnabled(cacheable=true)
    public static List<Course__c> getCourses(){
        return [Select Id, Name, Category__c, Description__c, Hours__c, IsActive__c, Price__c from Course__c];
    }



    @AuraEnabled(cacheable=true)
    public static PagedResult getPagedCourseList(
        String searchKey,
        Decimal maxPrice,
        Integer pageSize,
        Integer pageNumber
    ) {

        String likeString = '%' + searchKey + '%';
        Integer offset = (pageNumber - 1) * pageSize;

        /**Filtering Description only */
        List<String> idList = new List<String>();
        for(Course__c itr : [SELECT Id, Description__c FROM Course__c]){
            if(itr.Description__c.containsIgnoreCase(searchKey)){
                idList.add(itr.Id);
            }
        }
        /**________________________ */

        PagedResult result = new PagedResult();
            result.pageSize = pageSize;
            result.pageNumber = pageNumber;
            result.totalItemCount = [
                SELECT COUNT()
                FROM Course__c
                WHERE
                    Name LIKE :likeString OR Id IN : idList
            ];
        
        
            result.records = [
                SELECT
                    Id,
                    Name,
                    Hours__c,
                    Price__c,
                    Category__c,
                    IsActive__c,
                    Description__c
                FROM Course__c
                WHERE (Name LIKE : likeString) OR (Id IN : idList)
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

    
    /**@AuraEnabled
    public static List<sObject> getCourses(){
        try {
            return [
                SELECT
                    Id,
                    Name,
                    Hours__c,
                    Price__c,
                    Category__c,
                    IsActive__c,
                    Description__c
                FROM Course__c
            ];
        } catch (QueryException e) {
            return null;
        }
    } */
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