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
        // Normalize inputs
        Decimal safeMaxPrice = (maxPrice == null
            ? DEFAULT_MAX_PRICE
            : maxPrice);
        
        Integer safePageSize = (pageSize == null
            ? DEFAULT_PAGE_SIZE
            : pageSize);
        Integer safePageNumber = (pageNumber == null ? 1 : pageNumber);

        String searchPattern = '%' + searchKey + '%';
        Integer offset = (safePageNumber - 1) * safePageSize;

        PagedResult result = new PagedResult();
            result.pageSize = safePageSize;
            result.pageNumber = safePageNumber;
            result.totalItemCount = [
                SELECT COUNT()
                FROM Course__c
                WHERE
                    Name LIKE :searchPattern
                    AND Price__c <= :safeMaxPrice
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
            WHERE
                Name LIKE :searchPattern
                AND Price__c <= :safeMaxPrice
                ORDER BY Price__c
                LIMIT : safePageSize
                OFFSET : offset
                
        ];
        return result;
    }
}

// WITH SECURITY_ENFORCED
            


/**FIND searchPattern IN ALL FIELDS RETURNING Course__c(   Name,
                                                                Description__c, 
                                                                Hours__c, 
                                                                Price__c, 
                                                                Category__c, 
                                                                IsActive__c 
                                                                WHERE Price__c <= : safeMaxPrice
                                                                ORDER BY Price__c
                                                                LIMIT :safePageSize
                                                                OFFSET :offset
                                                                );
        */