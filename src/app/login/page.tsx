import { login, signup } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Wealth Ledger</CardTitle>
          <CardDescription>Đăng nhập hoặc đăng ký để quản lý tài sản</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            
            {searchParams?.message && (
              <div className="p-3 bg-rose-50 text-rose-400 text-sm rounded-md border border-rose-100">
                {searchParams.message}
              </div>
            )}
            
            <div className="flex flex-col space-y-2 pt-2">
              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
              <Button formAction={signup} type="submit" variant="outline" className="w-full">
                Tạo tài khoản mới
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
