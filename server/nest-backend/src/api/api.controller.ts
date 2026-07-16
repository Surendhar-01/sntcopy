import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  // --- Bills ---
  @Post('bills')
  createBill(@Body() body: any) {
    return this.apiService.createBill(body);
  }

  @Delete('bills/:id')
  deleteBill(@Param('id', ParseIntPipe) id: number) {
    return this.apiService.deleteBill(id);
  }

  @Delete('bills')
  clearBills() {
    return this.apiService.clearBills();
  }

  // --- Refills ---
  @Post('refills')
  createRefill(@Body() body: any) {
    return this.apiService.createRefill(body);
  }

  @Delete('refills/:id')
  deleteRefill(@Param('id', ParseIntPipe) id: number) {
    return this.apiService.deleteRefill(id);
  }

  @Delete('refills')
  clearRefills() {
    return this.apiService.clearRefills();
  }

  @Put('products/opening-stock/sync')
  syncOpeningStock() {
    return this.apiService.syncOpeningStock();
  }

  @Post('stock/repair')
  repairStock() {
    return this.apiService.repairStock();
  }

  // --- Price History ---
  @Post('price-history')
  createPriceHistory(@Body() body: any) {
    return this.apiService.createPriceHistory(body);
  }

  @Delete('price-history/:id')
  deletePriceHistory(@Param('id', ParseIntPipe) id: number) {
    return this.apiService.deletePriceHistory(id);
  }

  @Delete('price-history')
  clearPriceHistory() {
    return this.apiService.clearPriceHistory();
  }

  // --- Products ---
  @Put('products/:id/price')
  updateProductPrice(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.apiService.updateProductPrice(id, body);
  }

  @Post('products')
  createProduct(@Body() body: any) {
    return this.apiService.createProduct(body);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.apiService.deleteProduct(id);
  }

  // --- Accounts ---
  @Post('accounts')
  createAccount(@Body() body: any) {
    return this.apiService.createAccount(body);
  }

  @Put('accounts/:user/password')
  updateAccountPassword(@Param('user') user: string, @Body() body: any) {
    return this.apiService.updateAccountPassword(user, body);
  }

  @Delete('accounts/:user')
  deleteAccount(@Param('user') user: string) {
    return this.apiService.deleteAccount(user);
  }

  // --- Customers ---
  @Delete('customers')
  clearCustomers() {
    return this.apiService.clearCustomers();
  }

  @Post('reset-sales-data')
  resetSalesData() {
    return this.apiService.resetSalesData();
  }

  // --- Login Logs ---
  @Post('login-logs')
  createLoginLog(@Body() body: any) {
    return this.apiService.createLoginLog(body);
  }

  @Put('login-logs/:id/logout')
  logout(@Param('id', ParseIntPipe) id: number) {
    return this.apiService.logout(id);
  }

  @Delete('login-logs/:id')
  deleteLoginLog(@Param('id', ParseIntPipe) id: number) {
    return this.apiService.deleteLoginLog(id);
  }

  @Delete('login-logs')
  clearLoginLogs() {
    return this.apiService.clearLoginLogs();
  }

  // --- Shifts ---
  @Post('shifts/start')
  startShift(@Body() body: any) {
    return this.apiService.startShift(body);
  }

  @Post('shifts/end')
  endShift(@Body() body: any) {
    return this.apiService.endShift(body);
  }

  // --- Settings ---
  @Put('settings')
  updateSettings(@Body() body: any) {
    return this.apiService.updateSettings(body);
  }

  @Get('settings')
  getSettings() {
    return this.apiService.getSettings();
  }

  @Get('products')
  getProducts() {
    return this.apiService.getProducts();
  }

  @Get('bills')
  getBills() {
    return this.apiService.getBills();
  }

  @Get('customers')
  getCustomers() {
    return this.apiService.getCustomers();
  }

  @Get('refills')
  getRefills() {
    return this.apiService.getRefills();
  }

  @Get('price-history')
  getPriceHistory() {
    return this.apiService.getPriceHistory();
  }

  @Get('login-logs')
  getLoginLogs() {
    return this.apiService.getLoginLogs();
  }

  @Get('accounts')
  getAccounts() {
    return this.apiService.getAccounts();
  }
}
