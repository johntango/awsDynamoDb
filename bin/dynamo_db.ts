#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/cdk');
import { DynamoDbStack } from '../lib/dynamo_db-stack';

const app = new cdk.App();
new DynamoDbStack(app, 'DynamoDbStack');
app.run();
