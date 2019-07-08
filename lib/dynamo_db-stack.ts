import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
export class DynamoDbStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'helloVpc', { maxAZs: 2 });

    // Create an ECS cluster
    var cluster = new ecs.Cluster(this, 'Cluster', { vpc });
    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new ec2.InstanceType('t2.micro'),
      maxCapacity: 3
    });

    // hello service
    const dynamoTaskDefinition = new ecs.Ec2TaskDefinition(this, 'dynamo-task-definition', {});

    const dynamoContainer = dynamoTaskDefinition.addContainer('dynamo', {
      image: ecs.ContainerImage.fromRegistry('jrwtango/dynamo5'),
      memoryLimitMiB: 128
    });

    dynamoContainer.addPortMappings({
      containerPort: 3000
    });

    const dynamoService = new ecs.Ec2Service(this, 'dynamo-service', {
      cluster: cluster,
      desiredCount: 3,
      taskDefinition: dynamoTaskDefinition
    });
    // Internet facing load balancer for the frontend services

    const externalLB = new elbv2.ApplicationLoadBalancer(this, 'external', {
      vpc: vpc,
      internetFacing: true
    });

    const externalListener = externalLB.addListener('PublicListener', { port: 80, open: true });

    externalListener.addTargets('dynamo', {
      port: 80,
      targets: [dynamoService]
    });

    new cdk.CfnOutput(this, 'ExternalDNS', { value: externalLB.loadBalancerDnsName });
  }
}
