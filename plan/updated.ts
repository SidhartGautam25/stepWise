/*

there are few issues with the design we discussed in the first plan.

1. currently our tester is doing too much - it is responsible for running the tests, 
   collecting the results, and also providing an interface for users to interact with it. 
   this is a lot of responsibility for a single component and can lead to a lot of complexity.

2. currentlt tester folder is like this -> 
/testers
  /redis
  /http-server
  /react

  as you can see , for each challenge we have a separate folder which contains the test harness 
  and also the logic to run the tests and collect results.

  -> but loading the user code , running the tests and collecting results is same for all the challenges,
     the only thing that changes is the test harness.

  -> so we can separate the test harnesses from the logic to run the tests and collect results.
  -> also when we add a new language support, we will only need to add a new test harness and not
     change the logic to run the tests and collect results.
  -> so instead of mixing the execution engine , test logic , and challenge defination , we can have a clear 
     separation of concerns.


  -> so we are adding a new package called challenge-runner , which will handles
      1. loading the user code
      2. running the tests
      3. collecting results
      4. timeout handling and error case handling

  -> and tester package will only contain the test harnesses for different challenges and languages.
  -> example structure will look like this ->

/challenge-runner
  /index.ts  -> logic to run the tests and collect results

/testers
  /redis
    /go
      /harness.go  -> test harness for redis challenge in go
  /http-server
    /go
      /harness.go  -> test harness for http-server challenge in go
  /react
    /js
      /harness.js  -> test harness for react challenge in js

  -> a harness example for http challenge in go will look like this ->

package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "OK")
    })
    http.ListenAndServe(":8080", nil)
}


 -> other than these two , we will have a separate package for challenge definations, which will contain
    the details of each challenge like the description, test cases, etc.











*/
