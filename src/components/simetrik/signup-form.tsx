"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

export const SignupForm = () => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <FieldGroup className="gap-4">
        <Field className="gap-2">
          <FieldLabel htmlFor="fullName" className="leading-5">
            Nombre completo*
          </FieldLabel>
          <Input id="fullName" placeholder="Tu nombre y apellido" />
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="workEmail" className="leading-5">
            Correo corporativo*
          </FieldLabel>
          <Input type="email" id="workEmail" placeholder="nombre@empresa.com" />
        </Field>

        <Field>
          <Button className="w-full" type="submit">
            Crear cuenta gratis
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default SignupForm;
