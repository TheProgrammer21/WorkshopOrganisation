# Backend #
Install node and dependencies by executing `npm install`  
  
Create a `private.key` file inside the `/config` folder.  
    The file should contain the HS256 key for jwt.  
    Generate your key on the following website: https://mkjwk.org/  
        ..* Use key size `2048` or greater  
        ..* Use Algorithm `HS256 (HMAC using SHA-256)`  