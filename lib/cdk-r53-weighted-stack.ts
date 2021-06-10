import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as elb from '@aws-cdk/aws-elasticloadbalancing';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnOutput } from '@aws-cdk/core';

export class CdkR53WeightedStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const mydomain = 'mydomain.com';
    const vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 2,
    });
    const lb1 = new elb.LoadBalancer(this, 'lb1', {
      vpc,
      internetFacing: true,
      healthCheck: {
        port: 80,
      },
    });
    lb1.addListener({ externalPort: 80 });

    const lb2 = new elb.LoadBalancer(this, 'lb2', {
      vpc,
      internetFacing: true,
      healthCheck: {
        port: 80,
      },
    });
    lb2.addListener({ externalPort: 80 });

    const zone = r53.HostedZone.fromLookup(this, 'myzoneid', {
      domainName: mydomain,
    });

    const r1 = new r53.CfnRecordSet(this, 'r1', {
      name: 'w3.' + mydomain,
      type: 'A',
      hostedZoneId: zone.hostedZoneId,
      setIdentifier: 'r1',
      aliasTarget: {
        dnsName: lb1.loadBalancerDnsName,
        hostedZoneId: lb1.loadBalancerCanonicalHostedZoneNameId,
      },
      weight: 100,
    });

    const r2 = new r53.CfnRecordSet(this, 'r2', {
      name: 'w3.' + mydomain,
      type: 'A',
      hostedZoneId: zone.hostedZoneId,
      setIdentifier: 'r2',
      aliasTarget: {
        dnsName: lb2.loadBalancerDnsName,
        hostedZoneId: lb2.loadBalancerCanonicalHostedZoneNameId,
      },
      weight: 0,
    });

    new CfnOutput(this, 'zoneid', {
      value: zone.hostedZoneId,
    });
    new CfnOutput(this, 'r1dns', {
      value: lb1.loadBalancerDnsName,
    });
    new CfnOutput(this, 'r2dns', {
      value: lb2.loadBalancerDnsName,
    });
    new CfnOutput(this, 'r1z', {
      value: lb1.loadBalancerCanonicalHostedZoneNameId,
    });
    new CfnOutput(this, 'r2z', {
      value: lb2.loadBalancerCanonicalHostedZoneNameId,
    });
  }
}
