import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import React from "react";
import { BeatLoader } from "react-spinners";

const login = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          to your account if you already have one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Input name="email" type="email" placeholder="Enter Email"></Input>
        </div>
        <div className="space-y-1">
          <Input
            name="password"
            type="password"
            placeholder="Enter Password"
          ></Input>
        </div>
      </CardContent>
      <CardFooter>
        <Button>
          {" "}
          {true ? <BeatLoader size={10} color="whi" /> : "Login"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default login;
