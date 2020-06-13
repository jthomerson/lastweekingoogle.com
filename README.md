# LastWeekinGoogle.com

<a href="https://lastweekingoogle.com">
   <img src="https://lastweekingoogle.com/images/noun_Beaver_3263710.svg" width="80" style="float: left">
</a>

I created this site ([lastweekingoogle.com](https://lastweekingoogle.com)) as a joke, but
the code to create it is very much real and may be helpful to you, so I'm publishing it
here. This codebase contains all of the code necessary to host your own site on AWS S3 and
CloudFront, including:

   * An SSL certificate, using Certificate Manager
   * DNS, using Route53
   * An S3 bucket to host your static content
      * The bucket is not directly accessible via the internet; users must go through
        CloudFront to access your site
   * A CloudFront distribution; actually two:
      * One for www.lastweekingoogle.com, which redirects to your main site:
      * [lastweekingoogle.com](https://lastweekingoogle.com), the actual site
   * Two Lambda@Edge functions:
      * One for www.lastweekingoogle.com, handling the redirect to your apex site
      * One for your actual site, allowing URLs to subfolders within the site, without
        needing the trailing `/index.html`. For example, go to
        https://lastweekingoogle.com/subfolder/

## How to Deploy Your Own Site

```sh
# Clone and set up this repo
git clone git@github.com:jthomerson/lastweekingoogle.com.git
cd lastweekingoogle.com
npm install

# Install the Serverless Framework
npm install -g serverless

# Change the domain to your own
# This is a one-liner, but you'll probably want to edit these two files manually:
#    - infra/lastweekingoogle-dns/serverless.yml
#    - infra/lastweekingoogle-site/serverless.yml
sed -i 's|lastweekingoogle|yoursite|' infra/lastweekingoogle-{dns,site}/serverless.yml

# Now deploy both services
cd infra/lastweekingoogle-dns
serverless deploy

cd ../lastweekingoogle-site
serverless deploy
```

### Using Your New DNS Hosted Zone

Now your site should be fully deployed. Because this sets up a hosted zone for DNS, you
will also need to go to your domain registrar to point your domain's name servers at the
ones that were set up in this hosted zone. Here's a quick overview of how to do that:

First, obtain the name servers for your new Route53 hosted zone. If you want to do that on
the CLI, you can do this:

```sh
# Get the ID of your hosted zone
# Replace lastweekingoogle.com with your own domain name
# Make sure to leave the trailing period after "com"
aws route53 list-hosted-zones --query "HostedZones[?Name=='lastweekingoogle.com.'].Id"

# Insert the ID that you just got into the id paramter here:
aws route53 get-hosted-zone \
   --id "/hostedzone/ABCDEEF1234ZXYWMNJ12AA" \
   --query 'DelegationSet.NameServers'

```

You can also go to Route53 in the AWS web console and copy the "NS" records from there.

Once you have those, go to your domain registrar and enter those four servers (or at
least two of them) in the custom DNS fields. How you do this varies based on your
registrar.


### Deploying the Actual Site Content

Here's how you deploy the site content:

```sh
# From the root folder of the repo (where this README lives):
aws s3 sync ./site/ s3://lastweekingoogle-site-prd/
```

Of course, that's my bucket name. You'll need to replace the S3 bucket name with whatever
you named the bucket when you deployed the [lastweekingoogle-site
service](./infra/lastweekingoogle-site/serverless.yml).


## How Does it Work?

There are two services in this repo, both of which are using the
[Serverless Framework](https://www.serverless.com/framework/docs/). Using this framework
is a simple way to get started deploying your infrastructure as code. Everything in the
`Resources` section of the `serverless.yml` file is plain CloudFormation template. But,
the framework helps you by greatly simplifying the deployment of the CloudFormation
template, as well as deploying the Lambda functions that are included in our site.

What are the two services?

   * [lastweekingoogle-dns](./infra/lastweekingoogle-dns/serverless.yml) - this creates
     the Route53 hosted zone for your DNS.
   * [lastweekingoogle-site](./infra/lastweekingoogle-site/serverless.yml) - this creates
     the actual site and all the associated resources for it, including the bucket, SSL
     cert, two CloudFront distributions, and two Lambda@Edge functions.

These could've easily been combined into a single service. But, I felt that DNS should not
be mixed in with the site. Also, by using two separate services, it demonstrates how to
export a value (the Route53 hosted zone ID) from one service and import it into the other.

Sorry, I know this isn't the most complete tutorial on how to create a static hosting site
on AWS. If you have any questions, [hit me up on Twitter](https://twitter.com/jthomerson).