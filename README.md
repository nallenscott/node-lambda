<h1 align="center">
  <img src="node.png" width=300 alt=""><br>
  node-lambda<br>
</h1>

Simple examples of how to build a Node.js Lambda function and deploy it to AWS Lambda as a ZIP file or a scratch container image.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/en/download/)
- [pkg](https://github.com/vercel/pkg)

## Getting started

1. Clone this repo and `cd` into it:

    ```bash
    git clone https://github.com/nallenscott/node-lambda.git && cd node-lambda
    ```

2. Create an IAM role for your Lambda functions:

    ```bash
    aws iam create-role \
      --role-name node-lambda-role \
      --assume-role-policy-document file://policy.json

    aws iam attach-role-policy \
      --role-name node-lambda-role \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    ```

3. Export AWS environment variables:

    ```bash
    export AWS_ACCOUNT_ID=<YOUR_AWS_ACCOUNT_ID>
    export AWS_REGION=<YOUR_AWS_REGION>
    export IAM_ROLE_ARN=$(aws iam get-role --role-name node-lambda-role --query Role.Arn --output text)
    ```

## :zipper_mouth_face: Deploying as a ZIP file

1. Build the binary and zip it:

    ```bash
    pkg -t latest-linux-x64 -o bootstrap .
    zip node-lambda.zip bootstrap
    ```

2. Deploy the Lambda function:

    ```bash
    aws lambda create-function \
      --function-name node-lambda-zip \
      --zip-file fileb://node-lambda.zip \
      --handler index.handler \
      --runtime provided.al2023 \
      --role $IAM_ROLE_ARN
    ```

## :whale: Deploying as a scratch container image

1. Build the container image:

    ```bash
    docker build -t node-lambda-scratch .
    ```

2. Create an ECR repository and log in to it:

    ```bash
    aws ecr create-repository \
      --repository-name node-lambda-repo

    aws ecr get-login-password | docker login \
      --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com \
      --username AWS
    ```

3. Push the container image to ECR:

    ```bash
    docker tag node-lambda-scratch:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/node-lambda-repo:latest

    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/node-lambda-repo:latest
    ```

4. Deploy the Lambda function:

    ```bash
    aws lambda create-function \
      --function-name node-lambda-scratch \
      --package-type Image \
      --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/node-lambda-repo:latest \
      --role $IAM_ROLE_ARN
    ```
