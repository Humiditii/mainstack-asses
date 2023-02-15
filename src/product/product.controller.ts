import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { Response } from "express";
import { CreateProductDto, EditProductDto, GetProductsDto, QuantityDto } from "./dto/product.dto";
import { MainStackRes } from "../common/interfaces/interfaces";
import { JwtAuthGuard } from "../guard/jwt.guard";
import { RoleGuard } from "../guard/roles.guard";
import { Roles } from "../guard/decorator/roles.decorator";
import { Role } from "../guard/interface/role.enum";

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {

    constructor( private readonly productService:ProductService ){}

    private resBody(message:string, status:number, data?:object):MainStackRes{
        return{
          message: message ?? 'success!',
          statusCode: status,
          data:data ?? null
        }
    }

    @UseGuards(RoleGuard)
    @Roles(Role.Admin)
    @Post('create')
    async createProduct(
        @Body() createProductDto:CreateProductDto,
        @Res() res:Response,
        @Req() req:any
    ):Promise<Response>{

        createProductDto.adminId = req.user.userId

        const data:Awaited<object> = await this.productService.createProduct(createProductDto)

        return res.status(201).json(this.resBody('a new product added',201,data))
    }

    @Get('view')
    async viewProducts(
        @Res() res:Response,
        @Req() req:any,
        @Query('batch') batch:number,
        @Query('search') search?:string,
        @Query('productCategory') productCategory?:string
    ):Promise<Response>{

        function payload():Partial<GetProductsDto>{
            return {
                search: search ??  null,
                batch: batch ?? 1,
                productCategory: productCategory ?? null,
                adminId: req.user.userId
            }
        }

        const data:Awaited<object> = await this.productService.viewProducts(payload())

        return res.status(201).json(this.resBody('Products fetched!',200,data))
    }

    @Get('view/:productId')
    async viewSingleProduct(
        @Res() res:Response,
        @Param('productId') productId:string
    ):Promise<Response>{

        const data:Awaited<object> = await this.productService.viewSingleProduct(productId)

        return res.status(201).json(this.resBody('Product fetched!',200,data))
    }

    @UseGuards(RoleGuard)
    @Roles(Role.Admin)
    @Patch('edit/:productId')
    async editProduct(
        @Body() editProductDto:EditProductDto,
        @Res() res:Response,
        @Param('productId') productId:string
    ):Promise<Response>{

        editProductDto.productId = productId

        const data:Awaited<object> = await this.productService.editProduct(editProductDto)

        return res.status(201).json(this.resBody(`Product with id:${editProductDto.productId} edited`,200,data))
    }

    @UseGuards(RoleGuard)
    @Roles(Role.Admin)
    @Delete('delete/:productId')
    async deleteProduct(
        @Res() res:Response,
        @Param('productId') productId:string
    ):Promise<Response>{

        await this.productService.deleteProduct(productId)

        return res.status(201).json(this.resBody(`Product with id:${productId} deleted`,200))
    }

    @UseGuards(RoleGuard)
    @Roles(Role.Admin)
    @Post('inc-quantity/:productId')
    async updateQuantity(
        @Body() quantityDto:QuantityDto,
        @Res() res:Response,
        @Req() req:any,
        @Param('productId') productId:string
    ):Promise<Response>{

        quantityDto.productId = productId

        const data:Awaited<object> = await this.productService.updatePrductQuantity(quantityDto)

        return res.status(201).json(this.resBody('Product quantity incremented',200,data))
    }
}