import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, MessageSquare, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Sample data for charts
  const contentData = [
    { name: 'Jan', posts: 4 },
    { name: 'Feb', posts: 7 },
    { name: 'Mar', posts: 5 },
    { name: 'Apr', posts: 10 },
    { name: 'May', posts: 8 },
    { name: 'Jun', posts: 12 },
  ];

  const platformData = [
    { name: 'Twitter', value: 35, color: '#1DA1F2' },
    { name: 'LinkedIn', value: 25, color: '#0A66C2' },
    { name: 'Instagram', value: 20, color: '#E1306C' },
    { name: 'Facebook', value: 15, color: '#1877F2' },
    { name: 'Other', value: 5, color: '#6c757d' },
  ];

  const contentTypeData = [
    { name: 'Short-form', value: 45, icon: FileText },
    { name: 'Long-form', value: 30, icon: FileText },
    { name: 'Threads', value: 15, icon: MessageSquare },
    { name: 'Polls', value: 10, icon: FileText },
  ];

  const recentPosts = [
    { id: 1, platform: 'Twitter', content: 'Exciting news! We just launched our new product...', date: '2 hours ago', engagement: 124 },
    { id: 2, platform: 'LinkedIn', content: "We're thrilled to announce our latest partnership with...", date: '1 day ago', engagement: 87 },
    { id: 3, platform: 'Instagram', content: 'Check out our behind-the-scenes look at our team retreat!', date: '3 days ago', engagement: 203 },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="h-4 w-4 text-[#1DA1F2]" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-[#0A66C2]" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-[#E1306C]" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-[#1877F2]" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">46</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.4% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Twitter className="h-5 w-5 mr-2 text-[#1DA1F2]" />
              Twitter
            </div>
            <p className="text-xs text-muted-foreground">35% of total content</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4k</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Content Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <div className="text-lg font-medium text-center">Chart Coming Soon!</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="platform">
              <TabsList className="mb-4">
                <TabsTrigger value="platform">By Platform</TabsTrigger>
                <TabsTrigger value="type">By Type</TabsTrigger>
              </TabsList>
              
              <TabsContent value="platform">
                <div className="h-72">
                  <div className="text-lg font-medium text-center">Chart Coming Soon!</div>
                </div>
              </TabsContent>
              
              <TabsContent value="type">
                <div className="h-72">
                  <div className="text-lg font-medium text-center">Chart Coming Soon!</div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <div key={post.id} className="flex items-start p-3 rounded-lg border border-border/40">
                <div className="mr-3 mt-1">
                  {getPlatformIcon(post.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.content}</p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.engagement} engagements</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
