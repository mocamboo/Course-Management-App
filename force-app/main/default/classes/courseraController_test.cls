@isTest
public class courseraController_test {
    
    @isTest static void validateHelloWorld() {
        Course__c course = new Course__c( 
            Name='Learn how to write test class', Price__c=1000, Category__c = 'IT', IsActive__c = true, Hours__c = '44',
            Description__c='This course will teach you how to write test classes for apex controllers to verify functionality of the code.');
        Course__c course2 = new Course__c( 
            Name='Learn how to write test class', Price__c=1000, Category__c = 'IT', IsActive__c = false, Hours__c = '44',
            Description__c='This course will teach you how to write test classes for apex controllers to verify functionality of the code.');

        // Insert a new Course
        Test.startTest();
        insert course;
        insert course2;
        Test.stopTest();
        
        // Retrieve the new Course
        PagedResult result = courseraLwcController.getPagedCourseList('',6,1);
        
        // Test
        System.assertEquals(1, result.records.size());
    }

    @isTest static void test_getAllCustomers(){
        Contact a = new Contact(lastName='Jangid');

        Test.startTest();
        insert a;
        Test.stopTest();

        List<Contact> newList = courseraLwcController.getAllCustomers();

        System.assertEquals(1, newList.size());
        System.assertEquals('Jangid', newList.get(0).Name);
    }
    @isTest static void test_getPicklistValues(){

    }
}